(ns {{name}}.app
  (:require [dataspex.core :as dataspex]
            [nexus.registry :as nxr]
            [replicant.dom :as r]
            {{name}}.db
            {{name}}.events
            {{name}}.i18n
            {{name}}.ui))

(defonce el (js/document.getElementById "app"))

(defn ^:dev/after-load render []
  (let [state @{{name}}.db/store]
    (r/render el ({{name}}.ui/main state)
              {:alias-data {:dictionaries {{name}}.i18n/dictionaries
                            :locale (state :locale :en)}})))

(defn init []
  (nxr/register-system->state! deref)
  (r/set-dispatch! #(nxr/dispatch {{name}}.db/store %1 %2))
  (dataspex/inspect "{{title}}" {{name}}.db/store)
  (nxr/dispatch {{name}}.db/store nil [[:effect/init]])
  (render)
  (add-watch {{name}}.db/store ::render
             (fn [_ _ _ state]
               (r/render el ({{name}}.ui/main state)
                         {:alias-data {:dictionaries {{name}}.i18n/dictionaries
                                       :locale (state :locale :en)}}))))
