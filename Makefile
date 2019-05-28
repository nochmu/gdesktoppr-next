
bin_name = gdesktoppr-next
target   = node10-linux-x64

.PHONY: clean clean_all test
.DEFAULT_GOAL := $(bin_name)

# Targets

node_modules: package.json
	npm install

$(bin_name): node_modules gdesktoppr-next.js
	pkg -t $(target)  . -o  $(bin_name)

test: $(bin_name)
	./$(bin_name)

clean:
	rm -rf $(bin_name)

clean_all: clean
	rm -rf node_modules
