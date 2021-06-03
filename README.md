# VisionJS Framework

Simple Javascript Framework built from the ground up with eCommerce and SEO in mind.

## Examples
### On Click & Conditional Elements
Use `vsn-click` on an element to execute some code. Here we have a button that toggles the root scope variable `show` between false and true. 

    <button vsn-click="show = !show">Toggle</button>
    <span vsn-if="show">On</span>
    <span vsn-if="!show">Off</span>


### Attribute Binding
Use `vsn-bind:attribute` to bind a scope variable to the element's attribute. Using `vsn-bind` on an input will bind the input's value to the scope variable. 

    <a href="/index.html" vsn-name="link" vsn-bind:href="link.url" vsn-bind="link.text">Home</a>
    <input type="text" vsn-bind="link.text" />
    <input type="text" vsn-bind="link.url" />
