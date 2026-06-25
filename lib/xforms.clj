(ns xforms)

(defn split-by [pred]
  (let [buffer (volatile! nil)]
    (fn [rf]
      (fn
        ([] (rf))
        ([res]
         (if-let [buffer' (seq @buffer)]
           (rf (rf res buffer'))
           (rf res)))
        ([res item]
         (if-let [buffer' @buffer]
           (if (pred item)
             (do
               (vreset! buffer [item])
               (if (seq buffer')
                 (rf res buffer')
                 res))
             (do
               (vswap! buffer conj item)
               res))
           (do (vreset! buffer [item])
               res)))))))

(def take-until (comp take-while complement))
(def drop-until (comp drop-while complement))

(defn take-to [pred]
  (fn [rf]
    (fn
      ([] (rf))
      ([res] (rf res))
      ([res item]
       (if (pred item)
         (reduced (rf res item))
         (rf res item))))))
