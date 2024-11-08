(require '[babashka.deps :as deps])
(deps/add-deps '{:deps {etaoin/etaoin {:mvn/version "1.0.40"}
                        hashp/hashp {:mvn/version "0.2.2"}
                        mvxcvi/puget {:mvn/version "1.3.4"}}})
(require 'hashp.core)
