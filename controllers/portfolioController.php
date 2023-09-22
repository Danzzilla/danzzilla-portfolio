<?php

/**
 * Controller class for fat free
 */
class PortfolioController
{
    private $_f3;

    /**
     * Constructs a controller for $f3 passed in
     * @param $f3 - fat free
     */
    function __construct($f3)
    {
        $this->_f3 = $f3;
    }

    /**
     * Renders in the home page
     * @return void
     */
    function home()
    {
        $view = new Template();
        echo $view->render('views/home.html');
    }
}
