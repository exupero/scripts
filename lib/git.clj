(ns git
  (:require [clojure.java.shell :as shell]
            [clojure.string :as str]
            xforms))

(defn run [& cmd]
  (let [{:keys [out err exit]} (apply shell/sh cmd)]
    (if (pos? exit)
      (throw (Exception. err))
      (str/trimr out))))

(defmacro defn-with-dir [nm args & body]
  (let [dir (gensym 'dir)]
    `(defn ~nm
       (~args (~nm nil ~@args))
       (~(into [dir] args)
        (shell/with-sh-dir ~dir
          ~@body)))))

(defn-with-dir root []
  (run "git" "rev-parse" "--show-toplevel"))

(defn-with-dir commit []
  (run "git" "rev-parse" "HEAD"))

(defn-with-dir branch []
  (run "git" "branch" "--show-current"))

(defn-with-dir origin []
  (run "git" "config" "--get" "remote.origin.url"))

(defn-with-dir path [subpath]
  (str (root) "/" subpath))

(defn-with-dir full-path [relative-path]
  (run "git" "ls-files" "--full-name" relative-path))

(defn-with-dir changes? []
  (let [{:keys [out]} (shell/sh "git" "status" "-s")]
    (not (str/blank? out))))

(defn-with-dir status []
  (run "git" "status" "--short"))

(defn-with-dir origin []
  (let [{:keys [out exit]} (shell/sh "git" "remote" "get-url" "origin")]
    (when (zero? exit)
      (str/trim out))))

(defn-with-dir worktrees []
  (let [{:keys [out]} (shell/sh "git" "worktree" "list" "--porcelain")]
    (->> out
         str/split-lines
         (sequence
           (comp
             (xforms/split-by str/blank?)
             (map (partial remove str/blank?))))
         (map (fn [[path _ branch]]
                (let [[_ path] (str/split path #"\s+" 2)
                      [_ branch] (str/split branch #"\s+" 2)]
                  {:branch branch
                   :path path}))))))
