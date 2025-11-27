(ns {{name}}.app
  (:require [nexus.registry :as nxr]
            [replicant.dom :as r]
            {{name}}.db
            {{name}}.events
            {{name}}.ui))

(defonce el (js/document.getElementById "app"))

(defn ^:dev/after-load render []
  (r/render el ({{name}}.ui/main @{{name}}.db/conn)))

(defn init []
  (nxr/register-system->state! deref)
  (r/set-dispatch! #(nxr/dispatch {{name}}.db/conn %1 %2))
  (render)
  (add-watch {{name}}.db/conn ::render
             (fn [_ _ _ state]
               (r/render el ({{name}}.ui/main state)))))
