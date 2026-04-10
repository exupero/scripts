(ns portfolio
  (:require [portfolio.ui :as ui]
            [portfolio.replicant :refer-macros [defscene]]
            [replicant.dom :as r]
            {{name}}.ui))

(defscene main
  [{{name}}.ui/main {}])

(defn main []
  (r/set-dispatch! (fn [event-data actions]
                     (js/alert (str "REPLICANT DISPATCH!\n\nActions:\n" actions "\n\nData:\n" event-data))))
  (ui/start!
    {:config
     {:css-paths ["/style.css"]}}))
