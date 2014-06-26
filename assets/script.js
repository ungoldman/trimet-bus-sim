var map, panorama;
var appId = '09436B1C3122C7809C1DD2D9A';

function initialize() {
  var pdxLatLng = new google.maps.LatLng(45.5200,-122.6819);
  var mapEl = document.getElementById('map-canvas');
  var panoEl = document.getElementById('pano');
  var panoramaOptions = {
    position: pdxLatLng,
    pov: {
      heading: 34,
      pitch: 10
    }
  };

  map = new google.maps.Map(mapEl, {zoom: 14, center: pdxLatLng});
  panorama = new google.maps.StreetViewPanorama(panoEl, panoramaOptions);

  map.setStreetView(panorama);

  var activeBusId = 0;
  var busData = {};

  function busOutOfService(bus) {
    return bus.properties.route === 'U' || bus.properties.route === 'PI'
  }

  // server.addEventListener('add', function (e) {
  //   var bus = JSON.parse(e.data)
  //   busData[bus.id] = bus

  //   if (busOutOfService(bus)) { return }


  //   document.getElementById('buses').innerHTML += '<option id="bus'+bus.id+'" value="'+bus.id+'">' + bus.id + ' route ' + bus.properties.route + ' to ' + bus.properties.stop +'</option>'

  //   // set the first in-service bus we find to the active bus
  //   if (activeBusId && activeBusId !== bus.id) { return }
  //   activeBusId = bus.id

  //   draw(bus)
  // });

  // server.addEventListener('remove', function (e) {
  //   var bus = JSON.parse(e.data)
  //   if (activeBusId === bus.id) { activeBusId = 0}
  //   delete busData[bus.id]
  //   document.getElementById('buses').removeChild(document.getElementById('bus'+bus.id))
  // });

  // server.addEventListener('change', function (e) {
  //   var bus = JSON.parse(e.data)
  //   if (busOutOfService(bus)) { return }

  //   // update the select dropdown
  //   document.getElementById('bus'+bus.id).textContent = bus.id + ' route ' + bus.properties.route + ' to ' + bus.properties.stop

  //   if (activeBusId && activeBusId === bus.id) {
  //     draw(bus)
  //   }
  // });

  document.getElementById('realism').addEventListener('input', function () {
    document.getElementById('cockpit').style.opacity = document.getElementById('realism').value
  });

  document.getElementById('buses').addEventListener('change', function () {
    activeBusId = document.getElementById('buses').value
    draw(busData[activeBusId])
  });

  poll(4);
  setInterval(function() {
    poll(4);
  }, 30000);
}

function functionName(fn) {
  var ret = fn.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  return ret;
}

var cb_incr = 0;

function poll(route) {
  var cb_name = '__pdxBusCallback' + (cb_incr++);
  window[cb_name] = function(data) {
    delete window[cb_name];
    draw(data.resultSet.vehicle[0]);
  }
  var script = document.createElement('script');
  script.src = 'http://developer.trimet.org/ws/v2/vehicles/appId/' + appId + '/routes/' + route + '/callback/' + cb_name;
  document.getElementsByTagName('head')[0].appendChild(script);
}

function draw(bus) {
  var pos = new google.maps.LatLng(bus.latitude, bus.longitude);

  panorama.setPosition(pos);
  panorama.setPov({
    heading: bus.bearing,
    pitch: 10
  });

  // prevent greyness
  panorama.setVisible(true);

  map.panTo(pos);

  document.getElementById('details').textContent = JSON.stringify(bus,null,2);
}

google.maps.event.addDomListener(window, 'load', initialize);
