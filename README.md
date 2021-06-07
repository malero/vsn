# VisionJS Framework

Simple Javascript Framework built from the ground up with eCommerce and SEO in mind. VisionJS is meant to be used with server side rendered websites. Rather than dynamically rendering component templates like most javascript frameworks, VisionJS uses the html rendered by your server to add functionality to your website.

## Examples
### Set A Scope Variable
Use `vsn-set:variableName="value|type"` to set a variable in the scope. `vsn-set` is only used to initialize a value and will only be evaluated once. Use `vsn-bind` if you would like to bind the element to the scope variable.

    <div vsn-set:myInt="42|int"></div>
    <div vsn-set:myFloat="42.3|float"></div>
    <div vsn-set:myBool="false|bool"></div>


### Attribute Binding
Use `vsn-bind:attribute` to bind a scope variable to the element's attribute. Using `vsn-bind` on an input will bind the input's value to the scope variable. 

    <a href="/index.html" id="link">Home</a>
    <input type="text" vsn-bind="#link.@text" />
    <input type="text" vsn-bind="#link.@href" />


### On Click
Use `vsn-click` on an element to execute some code. Here we have a button that toggles the root scope variable `show` between false and true. 

    <button vsn-click="show = !show" vsn-set:show="false|bool">Toggle</button>
    <span vsn-bind="show"></span>


### Conditional Elements
Use `vsn-if` if you would only like to show an element if a certain condition is met.

    <button vsn-click="show = !show" vsn-set:show="false|bool">Toggle</button>
    <span vsn-if="show">Show is true</span>
    <span vsn-if="!show">Show is false</span>


### Controllers
Use `vsn-controller:variable="ClassName"` to bind an element to a controller class.

Typescript class controller:

    class Controller {
        public on: boolean = false;

        doSomething($event, value) {
            $event.preventDefault();
            this.on = value;            
        }
    }
    vision.registerClass(Controller, 'Controller');

HTML to use the above controller:

    <div vsn-controller:controller="Controller">
        <span vsn-if="controller.on">It's on!</span>
        <span vsn-if="!controller.on">It's off...</span>
        <a href="/" vsn-click="controller.doSomething($event, !controller.on)">Click Me</a>
    </div>
