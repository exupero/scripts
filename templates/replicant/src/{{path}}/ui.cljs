(ns {{name}}.ui
  (:require [replicant.alias :refer [defalias]]
            [{{name}}.components :as c]))

(defn main [state]
  [:div
   [:main
    [:div.container
     [:h1 "{{title}}"]]]])
