# linter-tlint

This linter plugin for [Linter](https://github.com/AtomLinter/Linter) provides
an interface to [tlint](https://github.com/tighten/tlint). It will be used with
files that have the "PHP" syntax or PHP embedded within HTML.

## Requirements

This plugin requires a working copy of `tlint` to be installed. It can be
installed globally or locally, within your project.

```ShellSession
# globally
composer global require tightenco/tlint

# or locally
composer require tightenco/tlint
```

### Plugin installation

Either through the Atom settings UI, or via the command line:

```ShellSession
$ apm install linter-tlint
```

## Acknowledgements

This plugin is based on
[atom-linter-phpstan](https://github.com/atomlinter/atom-linter-phpstan) and all
of the code as of atom-linter-phpstan v2.20 has been squashed into project as
a83211d and 393ad18. Thank you to all of the [contributors to
atom-linter-phpstan](https://github.com/AtomLinter/atom-linter-phpstan/graphs/contributors)
for making this plugin trivial to develop!
