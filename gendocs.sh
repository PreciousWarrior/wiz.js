# /bin/bash
paths="typedefs.js clients/BaseClient.js clients/StudentClient.js"

rm -r build
rm -r docs

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
mv build/docs .