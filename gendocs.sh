# /bin/bash
paths="typedefs.js clients/BaseClient.js clients/StudentClient.js"

rm -r build

mkdir build
cp -r src/* build
for path in $paths
do
    fullpath="build/$path"
    echo "Removing occourences of 'Types.' in $fullpath"
    sed -i "s/Types\.//" $fullpath
done

cd build
../node_modules/.bin/jsdoc -d ../docs -c ../jsdoc.config.json $paths
cd ..