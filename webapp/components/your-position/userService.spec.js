describe("User position service test", function() {
	var service, geolocation;
    beforeEach(function() {
        beforeEach(module("r2m"));

        beforeEach(inject(function(_userLocationService_, _geolocation_) {
            service = _userLocationService_;
            geolocation = _geolocation_;
        }));

        spyOn(geolocation,"getLocation").andCallFake(function() {
                     var position = { coords: { latitude: 32.8569, longitude: -96.9628 } };
                     arguments[0](position);
        });
    });

    it("should initialize user location service", function() {
    	expect(service).toBeDefined();
    });


});