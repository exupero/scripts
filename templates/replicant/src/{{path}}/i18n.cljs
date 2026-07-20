(ns {{name}}.i18n
  (:require [m1p.core :as m1p]))

(def en
  [])

(def dictionaries
  (-> {:en en}
      (update-vals m1p/prepare-dictionary)))
