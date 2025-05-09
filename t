#!/usr/bin/env bb

(ns t
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [babashka.deps :as deps]
            [babashka.process :as p]
            selmer.parser
            git))
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

(defmulti execute (fn [cmd _] cmd))

(defmethod execute :init [_ {:keys [dir]}]
  (ensure-directory! dir)
  (ensure-directory! (str dir "/_templates"))
  (spit (str dir "/_templates/generic.md")
        "---\ncreated: {{datestamp}}\ntype: {{type}}\n---\n\n# {{title|safe}}\n\n"))

(defmethod execute :add [_ {[type title] :args :keys [dir]}]
  (let [type (types (keyword type))
        datestamp (dtf/format (dtf/of-pattern "yyyy-MM-dd") (ld/now))
        template (slurp (or (get-file (str dir "/_templates/" type ".md"))
                            (get-file (str dir "/_templates/generic.md"))))
        filename (str dir "/" datestamp "-" type "-" (slug title) ".md")]
    (spit filename
          (selmer.parser/render template
                                {:title title
                                 :datestamp datestamp
                                 :type type}))
    (p/shell (System/getenv "EDITOR") filename)))

(defmethod execute :list [_ {:keys [dir]}]
  (let [files (->> (io/file dir)
                   (.listFiles)
                   (filter #(.endsWith (.getName %) ".md"))
                   (sort-by #(.lastModified %))
                   reverse)]
    (doseq [file files]
      (println (.getName file)))))

(defmethod execute :edit [_ {[filename] :args :keys [dir]}]
  (let [filename (io/file dir filename)]
    (p/shell (System/getenv "EDITOR") (str filename))))

(when (= *file* (System/getProperty "babashka.file"))
  (let [[cmd & args] *command-line-args*
        dir (git/path "tasks")]
    (execute (keyword cmd)
             {:dir dir
              :args args})))
