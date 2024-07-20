"use strict";var s=function(r,e){return function(){return e||r((e={exports:{}}).exports,e),e.exports}};var t=s(function(l,i){
var a=require('@stdlib/assert-is-date-object/dist'),n=require('@stdlib/assert-is-integer/dist').isPrimitive,u=require('@stdlib/time-current-year/dist');function f(r){var e;if(arguments.length)if(a(r))e=r.getFullYear();else if(n(r))e=r;else return!1;else e=u();return e%100===0?e%400===0:e%4===0}i.exports=f
});var c=t();module.exports=c;
/** @license Apache-2.0 */
//# sourceMappingURL=index.js.map
