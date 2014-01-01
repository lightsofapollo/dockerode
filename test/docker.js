var Docker = require('../lib/docker');
var expect = require('chai').expect;

var docker = new Docker({socketPath: '/var/run/docker.sock'});

describe("#docker", function() {

  describe("#checkAuth", function() {
    it("should fail auth", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).not.to.be.null;

        //console.log(data);
        done();
      }

      docker.checkAuth({username: 'xpto', password: 'dang', email: 'xpto@pxpto.pt'}, handler);
    });
  });

  describe("#buildImage", function() {
    it("should build image from file", function(done) {
      this.timeout(60000);

      function handler(err, stream) {
        expect(err).to.be.null;

        stream.pipe(process.stdout, {end: true});

        stream.on('end', function() {
          done();
        });
      }

      docker.buildImage('./test/test.tar', {}, handler);
    });
  });

  describe("#getEvents", function() {
    it("should get events", function(done) {
      this.timeout(30000);

      function handler(err, stream) {
        expect(err).to.be.null;
        //stream.pipe(process.stdout, {end: true});
        done();
      }

      docker.getEvents({since: ((new Date().getTime()/1000) - 60).toFixed(0)}, handler);
    });
  });

  describe('#pull', function() {
    this.timeout(30000);

    // one image with one tag
    var repoTag = 'lightsofapollo/test-taskenv:fail';

    // XXX: Should this be an extra abstraction in docker.js?
    function locateImage(image, callback) {
      docker.listImages(function(err, list) {
        if (err) return callback(err);

        // search for the image in the RepoTags
        var image;
        for (var i = 0, len = list.length; i < len; i++) {
          if (list[i].RepoTags.indexOf(repoTag) !== -1) {
            // ah ha! repo tags
            return callback(null, docker.getImage(list[i].Id));
          }
        }

        return callback();
      });
    }

    beforeEach(function(done) {
      locateImage(repoTag, function(err, image) {
        if (err) return done(err);
        if (image) return image.remove(done);
        done();
      });
    });

    it('should pull image from remote source', function(done) {
      function handler() {
        locateImage(repoTag, function(err, image) {
          if (err) return done(err);
          // found the image via list images
          expect(image).to.be.ok;
          done();
        });
      }

      docker.pull(repoTag, function(err, stream) {
        if (err) return done(err);
        // XXX: Do we want the full stream in the test?
        stream.pipe(process.stdout);
        stream.once('end', handler);
      });
    });
  });

  describe("#run", function() {
    this.timeout(30000);
    it('should report malformed request errors', function(done) {
      function handler(err, data) {
        expect(err).to.be.ok;
        done();
      }

      docker.run(
        'ubuntu',
        'exit 1', // this is an invalid parameter type (it should be an array)
        process.stdout,
        true,
        handler
      );
    });

    it("should run a command", function(done) {
      function handler(err, data) {
        expect(err).to.be.null;
        console.log(data);
        done();
      }

      docker.run('ubuntu', ['bash', '-c', 'uname -a'], process.stdout, true, handler);
    });
  });

  describe("#createContainer", function() {
    it("should create and remove a container", function(done) {
      this.timeout(5000);

      function handler(err, container) {
        expect(err).to.be.null;
        //console.log('created: ' + container.id);
        container.remove(function(err, data) {
          expect(err).to.be.null;
          done();
        });
      }

      docker.createContainer({Image: 'ubuntu', Cmd: ['/bin/bash']}, handler);
    });
  });

  describe("#createImage", function() {
    it("should create an image", function(done) {
      this.timeout(120000);

      function handler(err, stream) {
        expect(err).to.be.null;

        stream.pipe(process.stdout, {end: true});

        stream.on('end', function() {
          done();
        });
      }

      docker.createImage({fromImage: 'ubuntu'}, handler);
    });
  });

  describe("#listContainers", function() {
    it("should list containers", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        //console.log(data);
        done();
      }

      docker.listContainers({all: 1}, handler);
    });
  });

  describe("#listImages", function() {
    it("should list images", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        //console.log(data);
        done();
      }

      docker.listImages({all: 1}, handler);
    });
  });

  describe("#version", function() {
    it("should return version", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        //console.log(data);
        done();
      }

      docker.version(handler);
    });
  });

  describe("#searchImages", function() {
    it("should return search results", function(done) {
      this.timeout(10000);

      function handler(err, data) {
        expect(err).to.be.null;
        //console.log(data);
        done();
      }

      docker.searchImages({term: 'node'}, handler);
    });
  });

  describe("#info", function() {
    it("should return system info", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        //console.log(data);
        done();
      }

      docker.info(handler);
    });
  });
});
