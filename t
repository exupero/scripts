#!/usr/bin/env bb

(ns t
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [babashka.deps :as deps]
            [babashka.process :as p]
            selmer.parser
            git
            markdown)
  (:import [java.io File]))
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

(defmulti execute (fn [cmd _] cmd))

(defmethod execute :init [_ {:keys [dir]}]
  (ensure-directory! dir)
  (ensure-directory! (str dir "/_templates"))
  (spit (str dir "/_templates/generic.md")
        "---\ncreated: {{datestamp}}\ntype: {{type}}\n---\n\n# {{title|safe}}"))

(defmethod execute :add [_ {[type] :args :keys [dir]}]
  (let [type (types (keyword type))
        datestamp (dtf/format (dtf/of-pattern "yyyy-MM-dd") (ld/now))
        template (slurp (or (get-file (str dir "/_templates/" type ".md"))
                            (get-file (str dir "/_templates/generic.md"))))
        content (selmer.parser/render template
                                      {:title ""
                                       :datestamp datestamp
                                       :type type})
        file (edit-tempfile dir content)
        edited-content (slurp file)
        title (-> edited-content
                  str/split-lines
                  (->> (filter (partial re-find #"^# ")))
                  first
                  (subs 2))
        filename (str dir "/" datestamp "-" type "-" (slug title) ".md")]
    (spit filename edited-content)))

; TODO add `list` sub-command that shows titles from file content
  ; TODO indicate states of items
  ; TODO include option to filter items by status

; TODO add `done` sub-command

(when (= *file* (System/getProperty "babashka.file"))
  (let [[cmd & args] *command-line-args*
        dir (git/path "tasks")]
    (execute (keyword cmd)
             {:dir dir
              :args args})))
