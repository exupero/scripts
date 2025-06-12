(require '[babashka.deps :as deps])
(deps/add-deps '{:deps {hashp/hashp {:mvn/version "0.2.2"}
                        mvxcvi/puget {:mvn/version "1.3.4"}}})
(require 'hashp.core)

(defmacro defp [nm & body]
  `(do (def ~nm ~@body)
       ~nm))
