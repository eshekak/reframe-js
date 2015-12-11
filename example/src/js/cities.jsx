var I = require('immutable');
var ReactDOM = require('react-dom');
var React = require('react');
var ReFrame = require('../../../dist/index');

var App = ReFrame.component({}, function (props, query, bus) {
    return (
        <div>
            <ContinentsList />
            <hr />
            <CountriesList />
            <hr />
            <CitiesList />
            <hr />
            <CityDescription />
        </div>
    );
});

var ContinentsList = ReFrame.component({}, function (props, query, bus) {
    var selected = query(['selected']);
    var selectedContinent = selected.get('continent');
    var continents = query(['continent-list']);
    return (
        <div>
            Continents:
            <ul>
                {continents.map(function (continent) {
                    return (
                        <li key={continent.get('id')}>
                            <a href
                               className={continent.equals(selectedContinent) ? "active" : "inactive"}
                               onClick={function (e) { bus.put(['select-continent', continent]); e.preventDefault(); }}>
                                {continent.get('name')}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
});

var CountriesList = ReFrame.component({}, function (props, query, bus) {
    var selected = query(['selected']);
    var selectedContinent = selected.get('continent');
    var selectedCountry = selected.get('country');
    var countries = query(['country-list', selectedContinent]);
    return (
        <div>
            Countries in: {selectedContinent ? selectedContinent.get('name') : '-----'}
            <ul>
                {countries.map(function (country) {
                    return (
                        <li key={country.get('id')}>
                            <a href
                               className={country.equals(selectedCountry) ? "active" : "inactive"}
                               onClick={function (e) { bus.put(['select-country', country]); e.preventDefault(); }}>
                                {country.get('name')}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    )
});

var CitiesList = ReFrame.component({}, function (props, query, bus) {
    var selected = query(['selected']);
    var selectedCountry = selected.get('country');
    var selectedCity = selected.get('city');
    var cities = query(['city-list', selectedCountry]);
    return (
        <div>
            Cities in: {selectedCountry ? selectedCountry.get('name') : '-----'}
            <ul>
                {cities.map(function (city) {
                    return (
                        <li key={city.get('id')}>
                            <a href
                               className={city.equals(selectedCity) ? "active" : "inactive"}
                               onClick={function (e) { bus.put(['select-city', city]); e.preventDefault(); }}>
                                {city.get('name')}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    )
});

var CityDescription = ReFrame.component({}, function (props, query, bus) {
    var selected = query(['selected']);
    var selectedCity = selected.get('city');
    return <div>{selectedCity ? selectedCity.get('name') : '-----'}</div>
});


var reframe = ReFrame();

reframe.registerHandler('select-continent', function (db, e, put) {
    var continent = e[1];
    var selected = I.fromJS({
        continent: continent,
        country: null,
        city: null
    });
    return db.setIn(['ui', 'selected'], selected);
});

reframe.registerHandler('select-country', function (db, e, put) {
   var country = e[1];
   return db.updateIn(['ui', 'selected'], function (selected) {
       return selected
           .set('country', country)
           .set('city', null);
   });
});

reframe.registerHandler('select-city', function (db, e, put) {
    var city = e[1];
    return db.updateIn(['ui', 'selected'], function (selected) {
        return selected.set('city', city);
    });
});

// data is static in model, it never changes, so it's good to have
// a base query made of it, to prevent unnecessary recomputations...
reframe.registerQuery('data', function () {
    return [
        ['*db*'],
        function (db) {
            return db.get('data');
        }
    ];
});

reframe.registerQuery('continent-list', function () {
    return [
        ['data'],
        function (data) {
            return data.get('continents');
        }
    ];
});

reframe.registerQuery('country-list', function (continent) {
    return [
        ['data'],
        function (data) {
            if (continent) {
                return data.get('countries').filter(function (c) {
                    return c.get('continent') == continent.get('id');
                });
            } else {
                return I.List();
            }
        }
    ];
});

reframe.registerQuery('city-list', function (country) {
    return [
        ['data'],
        function (data) {
            if (country) {
                return data.get('cities').filter(function (c) {
                    return c.get('country') == country.get('id');
                });
            } else {
                return I.List();
            }
        }
    ];
});

reframe.registerQuery('selected', function () {
    return [
        ['*db*'],
        function (db) {
            return db.getIn(['ui', 'selected']);
        }
    ];
});


var model = I.fromJS({
    data: {
        continents: [
            {id: 'europe', name: 'Europe'},
            {id: 'africa', name: 'Africa'},
            {id: 'asia', name: 'Asia'},
            {id: 'south-america', name: 'South America'},
            {id: 'north-america', name: 'North America'},
            {id: 'australia', name: 'Australia'},
            {id: 'antarctica', name: 'Antarctica'}
        ],
        countries: [
            {id: 'poland', continent: 'europe', name: 'Poland'},
            {id: 'germany', continent: 'europe', name: 'Germany'},
            {id: 'france', continent: 'europe', name: 'France'},
            {id: 'nigeria', continent: 'africa', name: 'Nigeria'},
            {id: 'tunisia', continent: 'africa', name: 'Tunisia'},
            {id: 'egypt', continent: 'africa', name: 'Egypt'},
            {id: 'india', continent: 'asia', name: 'India'},
            {id: 'japan', continent: 'asia', name: 'Japan'},
            {id: 'china', continent: 'asia', name: 'China'},
            {id: 'ecuador', continent: 'south-america', name: 'Ecuador'},
            {id: 'brazil', continent: 'south-america', name: 'Brazil'},
            {id: 'argentina', continent: 'south-america', name: 'Argentina'},
            {id: 'chile', continent: 'south-america', name: 'Chile'},
            {id: 'usa', continent: 'north-america', name: 'United States of America'},
            {id: 'canada', continent: 'north-america', name: 'Canada'},
            {id: 'australia', continent: 'australia', name: 'Australia'}
        ],
        cities: [
            {id: 'wroclaw', country: 'poland', 'name': 'Wrocław'},
            {id: 'warsaw', country: 'poland', 'name': 'Warsaw'},
            {id: 'berlin', country: 'germany', 'name': 'Berlin'},
            {id: 'frankfurt', country: 'germany', 'name': 'Frankfurt'},
            {id: 'paris', country: 'france', 'name': 'Paris'},
            {id: 'cairo', country: 'egypt', 'name': 'Cairo'}
        ]
    },
    ui: {
        selected: {
            continent: null,
            country: null,
            city: null
        }
    }
});

reframe.render(model, App, {}, document.getElementById('page'));
