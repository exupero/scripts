(ns {{name}}.components
  (:require [replicant.alias :refer [defalias]]
            [m1p.core :as m1p]))

(defalias i18n [{{:keys [dictionaries locale]} :replicant/alias-data :as params} [k]]
  (m1p/lookup {} (get dictionaries locale) k params))

(defalias interpolate [{{:keys [dictionaries locale]} :replicant/alias-data} [child]]
  (m1p/interpolate child {:dictionaries {:i18n (get dictionaries locale)}}))
