(ns {{name}}.db
  (:require [datascript.core :as d]))

(def schema {})

(defonce conn (d/create-conn schema))
