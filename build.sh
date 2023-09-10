#!/bin/bash

set -eu

mkdir public

src="vpm.niri.la/index_profile.html"
dst="vpm.niri.la/themes/PaperMod/layouts/partials/index_profile.html"

cp "$src" "$dst"

hugo

cp -r vpm.niri.la/public/* public
cp vpm.json public/content/