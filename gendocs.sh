# /bin/bash
paths="typedefs.js clients/BaseClient.js clients/StudentClient.js"

mkdir build
cp -r src build
for path in $paths
do
    fullpath="build/src/$path"
    echo "Removing occourences of 'Types.' in $fullpath"
    sed -i "s/Types\.//" $fullpath
done

cd build/src
jsdoc -d '../docs' $paths
cd ..
cd ..
ls
cp -r build/docs docs