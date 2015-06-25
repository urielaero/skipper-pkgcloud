var pkgcloud = require('pkgcloud');
var Stream = require('stream');
var Writable = Stream.Writable;
var Readable = Stream.Readable;
var Transform = Stream.Transform;
var path = require('path');
var mime = require('mime');

module.exports = function RackspaceStore(options) {
  options = options || {};

  var adapter = {};

  adapter.rm = function(fd, done){
    //se elimina fd y continua.
    done(new Error('TODO'));
  };

  adapter.ls = function(dirpath, done){
    //regresa arreglo de archivos y continua.
    done(null,[]);

  };

  adapter.read = function(fd, done){
    //lee el archivo o crea un stream
    done(new Error('TODO'));
  };

  adapter.simpleRenameStream = function(dir, name){
    var rename_ = new Transform({objectMode: true});
    rename_._transform = function(__file, enctype, next){
      __file.fd = path.join(dir, name);
      this.push(__file);
      next();
    };

    return rename_;
  };

  adapter.uploadStream = function(opts, done){
    var client = getClientStorage(options);
    var fd = opts.dirSave || '/';
    fd = path.join(fd, opts.name);
    var file = {
      container: options.container,
      remote: fd,
      contentType: mime.lookup(fd),
    };

    var writeStream = client.upload(file);

    writeStream.on('error', function(err){
      done(err);
    });

    writeStream.on('success', function(data){
        done();
    });

    return writeStream;
  }

  adapter.receive = pkgCloudReceiver;

  return adapter;

  function pkgCloudReceiver(opts){

    var receiver__ = Writable({ objectMode:true });

    var client = getClientStorage(options);

    receiver__.once('error', function(err){
      //console.log('once err',err);
    });

    receiver__._write = function(__newFile, encoding, next){

      var file = {
        container: options.container,
        remote: __newFile.fd,
        contentType: mime.lookup(__newFile.fd),
      };

      var wr = new Transform({ objectMode:true });
      wr._transform = function(chunk, enc, nextcb){
        this.push(chunk);
        nextcb();
      };

      wr.on('finish',function(){
        var basename = path.basename(__newFile.fd);
        options.after(wr, basename, next);
      });

      wr.on('error', next);

      var writeStream = client.upload(file);

      writeStream.on('error', function(err){
        receiver__.emit('error', err);
      });

      writeStream.on('progress', function(data){
        //console.log('progress', data);
      });

      writeStream.on('success', function(data){
        if(!options.after){
          next();
        } //if after next in finish.
      });

      if(options.after)
        __newFile.pipe(wr)
      __newFile.pipe(writeStream);

    };

    return receiver__;

  };

};

function findOrCreateContainer(options, done){
  done = done || function(){};

  var containerName = options.container || 'pkgcloud';
  var client = getClientStorage(options);

  client.getContainer(containerName, function(err,cont){
    if(err && err.statusCode == 404){//lo creamos
      containerExist = true;
      client.createContainer(containerName, done);
    }else{
      containerExist = true;
      done(null,cont);
    }
  });

}

function getClientStorage(options){
  var cl = {
    provider: options.provider || 'rackspace',
    username: options.username,
    apiKey: options.apiKey,
    region: options.region,
    useInternal: options.useInternal || false
  };
  return pkgcloud.storage.createClient(cl);
}
