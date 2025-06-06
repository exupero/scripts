#!/usr/bin/env bb

(ns sql
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.tools.cli :as cli]))

(def cli-options
  [["-u" "--unsafe NAME" "a field to treat as unsafe and inline into the SQL"
    :multi true
    :default []
    :update-fn conj]])

(def name-pattern #"\?([a-zA-Z0-9]+)\?")

(let [{{:keys [unsafe]} :options [context mods] :arguments}
      , (cli/parse-opts *command-line-args* cli-options)
      template (str/join "\n" (slurp *in*))
      unsafe (set unsafe)
      context (cond-> context
                      (.exists (io/file context)) , (-> io/file slurp)
                      true                        , read-string
                      mods                        , (merge (read-string mods)))]
  (println
    (str/replace template name-pattern
                 (fn [[_ nm]]
                   (let [v (context (keyword nm))]
                     (cond
                       (nil? v)
                       , (str \? nm \?)
                       (= :null v)
                       , "NULL"
                       (or (re-find #"^unsafe" nm) (unsafe nm))
                       , (if v (str v) (str \? nm \?))
                       (string? v)
                       , (str \' v \')
                       (uuid? v)
                       , (str \' v "'::uuid")
                       (and (vector? v) (every? uuid? v))
                       , (str "array[" (transduce (comp (map #(str \' % "'::uuid")) (interpose ", ")) str v) "]")
                       (and (vector? v) (every? string? v))
                       , (str "array[" (transduce (comp (map #(str \' % \')) (interpose ", ")) str v) "]")
                       :else (str v)))))))
