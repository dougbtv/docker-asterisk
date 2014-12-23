# dougbtv/homer-base

This is a base-image for building Homer components. Seeing there are a lot of dependencies, and I didn't untie them from [the bash script from which this is based](https://github.com/sipcapture/homer/blob/master/scripts/extra/homer_installer.sh). I packed those all into a base image, and built sub-images from this.

This Dockerfile should be built as:

    docker build -t dougbtv/homer-base

There is a set of Dockerfiles in a tree below this, which generally depend on this base image. The naming convention is as follows:

Looking at this example directory structure from the location of this Dockerfile.

```
.
|-- captagent
|   `-- Dockerfile
|-- captureserver
|   `-- Dockerfile
|-- homer
|   `-- Dockerfile
`-- ...
```

Build `./captagent/Dockerfile` as `dougbtv/homer-captagent` and `./captureserver/Dockerfile` as `dougbtv/homer-captureserver`

That's really all.