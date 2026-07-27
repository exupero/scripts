(ns {{name}}.dev
  (:require [dataspex.core :as dataspex]
            {{name}}.app
            {{name}}.db))

(defn init []
  (dataspex/inspect "{{title}}" {{name}}.db/store)
  (dataspex/inspect-taps)
  ({{name}}.app/init))
