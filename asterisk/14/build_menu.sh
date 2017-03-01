#!/usr/bin/env bash
# Blatently borrowed from: https://github.com/redhat-nfvpe/vnf-asterisk/blob/master/notes/compiling_asterisk.md
enable_mods=""
for arg; do
  enable_mods="${enable_mods} --enable $arg"
done

menuselect/menuselect --disable-all $enable_mods --enable-category MENUSELECT_BRIDGES --enable LOADABLE_MODULES menuselect.makeopts
