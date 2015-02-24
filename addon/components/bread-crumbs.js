import Ember from "ember";

export default Ember.Component.extend({
  router: null,
  applicationController: null,

  handlerInfos: (function() {
    return this.get("router").router.currentHandlerInfos;
  }).property("applicationController.currentPath"),

  pathNames: Ember.computed.mapBy("handlerInfos", "name"),

  // Using the `computed.mapBy`, we ran into the error below while transitioning between two routes with an _id param.
  // Error while processing route: 'route.name' Assertion Failed: You must use Ember.set() to set the `controller` property (of <app-name@route:route/name::ember1197>) to `<app-name@controller:controller/name::ember1095>`. Error: Assertion Failed: You must use Ember.set() to set the `controller` property (of <app-name@route:route/name::ember1197>) to `<app-name@controller:controller/name::ember1095>`.

  // does not work
  //controllers: Ember.computed.mapBy("handlerInfos", "handler.controller"),

  // does not work
  //controllers: Ember.computed.map('handlerInfos.@each.handler.controller', function(info) {
  //  return Ember.get(info, 'handler.controller');
  //}),

  // works
  //controllers: Ember.computed.map('handlerInfos', function(info) {
  //  return Ember.get(info, 'handler.controller');
  //}),

  // works
  controllers: function () {
    return this.get("handlerInfos").map(function(info) {
      return Ember.get(info, 'handler.controller');
    });
  }.property('handlerInfos.@each.handler.controller'),

  breadCrumbs: (function() {
    var controllers = this.get("controllers");
    var defaultPaths = this.get("pathNames");
    var breadCrumbs = [];

    controllers.forEach(function(controller, index) {
      var crumbName = controller.get("breadCrumb");
      if (!Ember.isEmpty(crumbName)) {
        var defaultPath = defaultPaths[index];
        var specifiedPath = controller.get("breadCrumbPath");
        return breadCrumbs.addObject({
          name: crumbName,
          path: specifiedPath || defaultPath,
          linkable: specifiedPath !== false,
          isCurrent: false
        });
      }
    });

    var deepestCrumb = breadCrumbs.get("lastObject");
    if (deepestCrumb) {
      deepestCrumb.isCurrent = true;
    }

    return breadCrumbs;
  }).property("controllers.@each.breadCrumb", "controllers.@each.breadCrumbPath", "pathNames.[]")
});
