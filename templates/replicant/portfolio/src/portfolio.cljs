(ns portfolio
  (:require [portfolio.ui :as ui]
            [portfolio.replicant :refer-macros [defscene]]
            [replicant.dom :as r]
            [nexus.registry :as nxr]
            {{name}}.events
            {{name}}.ui))

(defscene main-component
  [{{name}}.ui/main {}])

(defn main []
  (nxr/register-system->state! deref)
  (r/set-dispatch! #(nxr/dispatch store %1 %2))
  (ui/start!
    {:config
     {:css-paths ["/style.css"]}}))
