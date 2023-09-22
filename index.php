<?php

//Error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

//Autoload file required
require_once('vendor/autoload.php');

//Create instance of Base Class
$f3 = Base::instance();

//Create an instance of the Controller class
$controller = new PortfolioController($f3);

// Home/Default route
$f3->route('GET /', function(){
    $GLOBALS['controller']->home();
});

//Run fat free
$f3->run();