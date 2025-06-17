(require '[babashka.deps :as deps])
(deps/add-deps '{:deps {hashp/hashp {:mvn/version "0.2.2"}
                        mvxcvi/puget {:mvn/version "1.3.4"}
                        swiss-arrows/swiss-arrows {:mvn/version "1.0.0"}}})
(require 'hashp.core
         '[swiss.arrows :refer [-<> -<>>]])

(defmacro defp [nm & body]
  `(do (def ~nm ~@body)
       ~nm))
