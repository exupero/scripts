(ns main-scenes
  (:require [portfolio.replicant :refer-macros [defscene]]
            [{{name}} .ui :as ui]))

(defscene main-component
  ({{name}} .ui/main {}))
