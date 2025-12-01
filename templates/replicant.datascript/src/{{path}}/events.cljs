(ns {{name}}.events
  (:require [nexus.registry :as nxr]
            [datascript.core :as d]
            {{name}}.db))

(nxr/register-placeholder! :event.target/value
  (fn [{:replicant/keys [dom-event]}]
    (some-> dom-event .-target .-value)))

(nxr/register-placeholder! :event/node
  (fn [{:replicant/keys [node]}]
    node))

(nxr/register-effect! :effect/transact
  (fn [_ conn data]
    (d/transact! conn data)))
