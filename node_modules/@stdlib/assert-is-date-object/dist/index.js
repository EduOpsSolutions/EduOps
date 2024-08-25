"use strict";var e=function(r,t){return function(){return t||r((t={exports:{}}).exports,t),t.exports}};var s=e(function(j,a){
var o=Date.prototype.getDay;a.exports=o
});var u=e(function(h,i){
var f=s();function p(r){try{return f.call(r),!0}catch(t){return!1}}i.exports=p
});var c=e(function(l,n){
var D=require('@stdlib/assert-has-tostringtag-support/dist'),y=require('@stdlib/utils-native-class/dist'),g=u(),q=D();function v(r){return typeof r=="object"?r instanceof Date?!0:q?g(r):y(r)==="[object Date]":!1}n.exports=v
});var x=c();module.exports=x;
/** @license Apache-2.0 */
//# sourceMappingURL=index.js.map
