import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  require_OperatorSubscriber,
  require_lift
} from "./chunk-KCMVP6QR.js";
import {
  __commonJS
} from "./chunk-6DU2HRTW.js";

// node_modules/rxjs/dist/cjs/internal/operators/filter.js
var require_filter = __commonJS({
  "node_modules/rxjs/dist/cjs/internal/operators/filter.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.filter = void 0;
    var lift_1 = require_lift();
    var OperatorSubscriber_1 = require_OperatorSubscriber();
    function filter(predicate, thisArg) {
      return lift_1.operate(function(source, subscriber) {
        var index = 0;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function(value) {
          return predicate.call(thisArg, value, index++) && subscriber.next(value);
        }));
      });
    }
    exports.filter = filter;
  }
});

export {
  require_filter
};
//# sourceMappingURL=chunk-EV7M6D74.js.map
