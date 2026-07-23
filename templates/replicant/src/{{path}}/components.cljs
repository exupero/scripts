(ns {{name}}.components
  (:require [replicant.alias :refer [defalias]]
            [m1p.core :as m1p]))

(defalias i18n [{{:keys [dictionaries locale]} :replicant/alias-data :as params} [k]]
  (if (and dictionaries locale)
    (m1p/lookup {} (get dictionaries locale) k params)
    [:span]))

(defalias interpolate [{{:keys [dictionaries locale]} :replicant/alias-data} [child]]
  (m1p/interpolate child {:dictionaries {:i18n (get dictionaries locale)}}))
