(ns portfolio
  (:require portfolio.ui
            [portfolio.replicant :refer-macros [defscene]]
            [replicant.dom :as r]
            [nexus.registry :as nxr]
            {{name}} .events
            [{{name}} .ui :as ui]
            main-scenes))

(defn main []
  (nxr/register-system->state! deref)
  #_(r/set-dispatch! #(nxr/dispatch store %1 %2))
  (portfolio.ui/start!
   {:config
    {:css-paths ["/style.css"]}}))
