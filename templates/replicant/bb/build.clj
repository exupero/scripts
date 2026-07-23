(ns build
  (:require [clojure.java.io :as io]
            selmer.parser))

(defn index []
  (spit (io/file "resources" "public" "index.html")
        (selmer.parser/render
          (slurp (io/file "src" "index.html"))
          {:now (System/currentTimeMillis)})))
