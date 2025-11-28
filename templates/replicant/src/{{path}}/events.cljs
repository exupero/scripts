(ns {{name}}.events
  (:require {{name}}.db
            [nexus.registry :as nxr]))

(nxr/register-placeholder! :event.target/value
  (fn [{:replicant/keys [dom-event]}]
    (some-> dom-event .-target .-value)))
