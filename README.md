# ChaldeaStockObservatory

# Features
1.	Automatic download real-time stock data
2.	Stock Screener 		(TBD)
3.  Stock Notification 	(TBD)

# Support Platform 
  * Windows - Windows 10
  * Mac OS  - Mac OS 10.11+
  * Linux   - Ubuntu 16.04+
  
  P.S. 
  
  The Pyinstaller builds is not fully static([issue](https://stackoverflow.com/questions/17654363/pyinstaller-glibc-2-15-not-found)), and Electron-builder also doesn't support too old OS platform, if your OS is not compatible with ChaldeaStockObservatory, please just run it on source code instead of executble package.

# Core Module
  * [ChaldeaStockObservatory-Core](https://github.com/zmcx16/ChaldeaStockObservatory-Core)
  
# Development Environment
  * Nodejs
  * Electron  
  
# Dependencies
  * bootstrap 		4.3.1
  * detect-port 	1.3.0
  * jquery 			3.4.1
  * popper.js 		1.15.0
  * zerorpc			0.9.8

# Run
  * npm i
  * put ChaldeaStockObservatory-Core source code or executble files to relative path
  * run ".\node_modules\.bin\electron-rebuild" (optional, [issue](https://github.com/chunyenHuang/hummusRecipe/issues/70))
  * npm run start

  
# Demo

![image](https://github.com/zmcx16/ChaldeaStockObservatory/blob/master/demo/demo1.png)


# Reference
1. Darryl Dixon Piece Digital/Click-n-drag list rearranging - (https://codepen.io/piecedigital/pen/VLyrLo) - MIT License

# License
This project is licensed under the terms of the MIT license.
