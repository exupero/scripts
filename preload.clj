(require '[babashka.deps :as deps])
(deps/add-deps '{:deps {mvxcvi/puget {:mvn/version "1.3.4"}
                        hashp/hashp {:mvn/version "0.2.2"}}})
(require 'hashp.core)
