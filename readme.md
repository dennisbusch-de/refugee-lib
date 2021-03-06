# Refugee Lib
[version](http://www.dennisbusch.de/software/refugeelib/current/docs/rlCore.html#version) - 
(*this documentation is a work in progress and subject to be changed/extended as the library development progresses*)

development status: *working on it on a highly irregular(whenever I feel like it) basis*
  
## Introduction
The goal of **Refugee Lib** is to provide an easy-to-use HTML5/javascript library for writing games and applications which primarily run directly inside a website without the need to download and install any extensions.

**Refugee Lib** provides functions to handle common tasks like loading assets, running and maintaining a steady game main-loop, pre-processing input from different devices and calling user-defined callbacks when it is time to update game-state and view.

(It also provides (*will provide*) functions to handle a broad range of other things commonly useful in game development, like managing animations, testing for collisions, playing sounds, string localization, lightweight GUI building, displaying graphics and whatever else I think will be interesting to implement and useful to have.)

((A potential future expansion would be to add optional modules to utilize features which are only available to installable Chrome apps or to a node-webkit bundle, such as direct access to UDP/TCP sockets and the local filesystem.))
  
## Source / Download
The latest WIP version can be downloaded from the public GIT repository:  
[https://github.com/dennisbusch-de/refugee-lib](https://github.com/dennisbusch-de/refugee-lib)

## Third Party Libraries
Third party libraries are utilized or adopted and included by **Refugee Lib** under their respective licenses [as described here](https://github.com/dennisbusch-de/refugee-lib/blob/master/LICENSE.txt).
  
## License
Refugee Lib is an open source project, released under the "MIT License".

The MIT License (MIT)
 
Copyright(c) 2014, Dennis Busch  
[http://www.dennisbusch.de](http://www.dennisbusch.de) 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
