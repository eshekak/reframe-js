var I = require('immutable');
var ReactDOM = require('react-dom');
var React = require('react');
var ReFrame = require('../../../dist/index');

var App = ReFrame.component({}, function (props, query, bus) {
    return (
        <div>
            <ContinentList />
            <hr />
            <CountryList />
            <hr />
            <CityList />
            <hr />
            <CityDescription />
        </div>
    );
});

var ContinentList = ReFrame.component({}, function (props, query, bus) {
    var selected = query(['selected']);
    var selectedContinent = selected.get('continent');
    var continents = query(['continent-list']);
    return (
        <div>
            Continents:
            <ItemsList items={continents}
                       selectedItem={selectedContinent}
                       onSelect={function (continent) { bus.put(['select-continent', continent]); }} />
        </div>
    );
});

var CountryList = ReFrame.component({}, function (props, query, bus) {
    var selected = query(['selected']);
    var selectedContinent = selected.get('continent');
    var selectedCountry = selected.get('country');
    var countries = query(['country-list', selectedContinent]);
    return (
        <div>
            Countries in: {selectedContinent ? selectedContinent.get('name') : '-----'}
            <ItemsList items={countries}
                       selectedItem={selectedCountry}
                       onSelect={function (country) { bus.put(['select-country', country]); }} />
        </div>
    )
});

var CityList = ReFrame.component({}, function (props, query, bus) {
    var selected = query(['selected']);
    var selectedCountry = selected.get('country');
    var selectedCity = selected.get('city');
    var cities = query(['city-list', selectedCountry]);
    return (
        <div>
            Cities in: {selectedCountry ? selectedCountry.get('name') : '-----'}
            <ItemsList items={cities}
                       selectedItem={selectedCity}
                       onSelect={function (city) { bus.put(['select-city', city]); }} />
        </div>
    )
});

var ItemsList = function (props) {
    return (
        <ul>
            {props.items.map(function (i) {
                return (
                    <li key={i.get('id')}>
                        <a href
                           className={i.equals(props.selectedItem) ? "active" : "inactive"}
                           onClick={function (e) {props.onSelect(i); e.preventDefault(); }}>
                            {i.get('name')}
                        </a>
                    </li>
                );
            })}
        </ul>
    );
};

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
            {id: 'wroclaw', country: 'poland', name: 'Wrocław'},
            {id: 'warsaw', country: 'poland', name: 'Warsaw'},
            {id: 'berlin', country: 'germany', name: 'Berlin'},
            {id: 'frankfurt', country: 'germany', name: 'Frankfurt'},
            {id: 'paris', country: 'france', name: 'Paris'},
            {id: 'abuja', country: 'nigeria', name: 'Abuja'},
            {id: 'tunis', country: 'tunisia', name: 'Tunis'},
            {id: 'cairo', country: 'egypt', name: 'Cairo'},
            {id: 'thebes', country: 'egypt', name: 'Thebes'},
            {id: 'mumbai', country: 'india', name: 'Mumbai'},
            {id: 'beijing', country: 'china', name: 'Beijing'},
            {id: 'quito', country: 'ecuador', name: 'Quito'},
            {id: 'guayaquil', country: 'ecuador', name: 'Guayaquil'},
            {id: 'rio-de-janeiro', country: 'brazil', name: 'Rio de Janeiro'},
            {id: 'brasilia', country: 'brazil', name: 'Brasilia'},
            {id: 'buenos-aires', country: 'argentina', name: 'Buenos Aires'},
            {id: 'santiago-de-chile', country: 'chile', name: 'Santiago de Chile'},
            {id: 'new-york', country: 'usa', name: 'New York'},
            {id: 'chicago', country: 'usa', name: 'Chicago'},
            {id: 'los-angeles', country: 'usa', name: 'Los Angeles'},
            {id: 'seattle', country: 'usa', name: 'Seattle'},
            {id: 'denver', country: 'usa', name: 'Denver'},
            {id: 'toronto', country: 'canada', name: 'Toronto'},
            {id: 'ottawa', country: 'canada', name: 'Ottawa'},
            {id: 'vancouver', country: 'canada', name: 'Vancouver'},
            {id: 'sydney', country: 'australia', name: 'Sydney'},
            {id: 'canberra', country: 'australia', name: 'Canberra'}
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
