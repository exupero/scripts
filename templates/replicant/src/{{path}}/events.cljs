(ns {{name}}.events
  (:require [nexus.registry :as nxr]
            [nexus.strategies :as strategies]
            {{name}}.db))

(nxr/register-interceptor! strategies/fail-fast)

(nxr/register-interceptor!
  {:id :log-errors
   :after-action (fn [{:keys [errors] :as ctx}]
                   (when (seq errors)
                     (js/console.error "⚠️ Error expanding action")
                     (prn errors))
                   ctx)
   :after-effect (fn [{:keys [errors] :as ctx}]
                   (when (seq errors)
                     (js/console.error "⚠️ Error eexecuting effect")
                     (prn errors))
                   ctx)})

(nxr/register-placeholder! :event.target/value
  (fn [{:replicant/keys [dom-event]}]
    (some-> dom-event .-target .-value)))

(nxr/register-placeholder! :event/node
  (fn [{:replicant/keys [node]}]
    node))

(nxr/register-effect! :effect/save
  (fn [_ store path value]
    (swap! store assoc-in path value)))
