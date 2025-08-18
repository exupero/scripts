#!/usr/bin/env bb

(ns t
  (:require [clojure.java.io :as io]
            [clojure.pprint :as pprint]
            [clojure.string :as str]
            [babashka.deps :as deps]
            [babashka.process :as p]
            [clj-yaml.core :as yaml]
            selmer.parser
            git
            markdown)
  (:import [java.io File]
           [java.text SimpleDateFormat]))
(deps/add-deps '{:deps {com.widdindustries/cljc.java-time {:mvn/version "0.1.21"}}})
(require '[cljc.java-time.format.date-time-formatter :as dtf]
         '[cljc.java-time.local-date :as ld])

(def types
  {:task "task"
   :bug "bug"
   :fix "bug"
   :feat "feature"
   :feature "feature"})

(defn ensure-directory! [path]
  (let [dir (io/file path)]
    (when-not (.exists dir)
      (.mkdir dir))))

(defn get-file [path]
  (let [file (io/file path)]
    (when (.exists file)
      file)))

(defn slug [s]
  (-> s
      (str/replace #"'" "")
      (str/replace #"[^a-zA-Z0-9]+" "-")
      (str/replace #"^-+|-+$" "")
      str/lower-case))

(defn edit-tempfile [dir content]
  (let [tempfile (File/createTempFile "task-" ".md")]
    (spit tempfile content)
    @(p/shell {:dir dir} "nvim" tempfile)
    tempfile))

(defn fmt-date [date]
  (dtf/format (dtf/of-pattern "yyyy-MM-dd") date))

(defn update-frontmatter [filename f & args]
  (let [[fm content] (markdown/frontmatter+content (slurp filename))
        fm (apply f fm args)]
    (spit filename
          (str "---\n"
               (yaml/generate-string fm :dumper-options {:flow-style :block})
               "---\n"
               content))))

(defn parse-title [content]
  (-> content
      str/split-lines
      (->> (filter (partial re-find #"^# ")))
      first
      (subs 2)))

(defmulti execute (fn [cmd _] cmd))

(defmethod execute :init [_ {:keys [dir]}]
  (ensure-directory! dir)
  (ensure-directory! (str dir "/_templates"))
  (spit (str dir "/_templates/generic.md")
        "---\ncreated: {{datestamp}}\ntype: {{type}}\n---\n\n# {{title|safe}}"))

(defmethod execute :list [_ {[status] :args :keys [dir]}]
  (let [files (->> (io/file dir)
                   .listFiles
                   (sequence
                     (comp
                       (remove #(.isDirectory %))
                       (map (fn [file]
                              (let [[{:keys [created type status]} content] (markdown/frontmatter+content (slurp file))]
                                {:created (.format (SimpleDateFormat. "yyyy-MM-dd") created)
                                 :type type
                                 :status (or status "todo")
                                 :title (parse-title content)})))
                       (if status
                         (filter (comp #{status} :status))
                         (comp)))))]
    (doseq [{:keys [created type status title]} files]
      (println (format "%s %-7s %s %s" created type status title)))))

(defmethod execute :add [_ {[type title] :args :keys [dir]}]
  (let [type (types (keyword type))
        datestamp (fmt-date (ld/now))
        template (slurp (or (get-file (str dir "/_templates/" type ".md"))
                            (get-file (str dir "/_templates/generic.md"))))
        content (selmer.parser/render template
                                      {:title (or title "")
                                       :datestamp datestamp
                                       :type type})
        file (edit-tempfile dir content)
        edited-content (slurp file)
        title (parse-title edited-content)
        filename (str dir "/" datestamp "-" type "-" (slug title) ".md")]
    (spit filename edited-content)))

(defmethod execute :rename [_ {[filename] :args :keys [dir]}]
  (let [[{:keys [created type]} content] (markdown/frontmatter+content (slurp filename))
        datestamp (.format (SimpleDateFormat. "yyyy-MM-dd") created)
        title (parse-title content)
        new-filename (str dir "/" datestamp "-" type "-" (slug title) ".md")]
    (.renameTo (io/file filename) (io/file new-filename))))

(defmethod execute :label [_ {[filename & labels] :args}]
  (update-frontmatter filename (partial apply update) :labels (fnil conj #{}) labels))

(defmethod execute :wont [_ {[filename] :args}]
  (update-frontmatter filename assoc :status "wont" :wont (fmt-date (ld/now))))

(defmethod execute :done [_ {[filename] :args}]
  (update-frontmatter filename assoc :status "done" :done (fmt-date (ld/now))))

(when (= *file* (System/getProperty "babashka.file"))
  (let [[cmd & args] *command-line-args*
        dir (git/path "tasks")]
    (execute (keyword cmd)
             {:dir dir
              :args args})))
