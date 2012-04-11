all:: bem-bl
all:: $(patsubst %.bemjson.js,%.html,$(wildcard pages/*/*.bemjson.js))
all:: $(patsubst %.bemjson.js,%.html,$(wildcard pages-*/*/*.bemjson.js))

BEM=bem

BEM_BUILD=$(BEM) build \
	-l bem-bl/blocks-common/ \
	-l bem-bl/blocks-desktop/ \
	-l blocks/ \
	-l blocks-$2/ \
	-l $(@D)/blocks/ \
	-d $< \
	-t $1 \
	-o $(@D) \
	-n $(*F)	

BEM_CREATE=$(BEM) create block \
		-l $2 \
		-T $1 \
		--force \
		$(*F)

%.html: %.bemhtml.js %.css %.js %.bemhtml.js
	$(call BEM_CREATE,bem-bl/blocks-common/i-bem/bem/techs/html.js,$(firstword $(subst /, ,$(dir $@))))

.PRECIOUS: %.bemhtml.js
%.bemhtml.js: %.deps.js
	$(call BEM_BUILD,bem-bl/blocks-common/i-bem/bem/techs/bemhtml.js,$(word 2,$(subst -, ,$(firstword $(firstword $(subst /, ,$(dir $@)))))))

%.deps.js: %.bemdecl.js
	$(call BEM_BUILD,deps.js,$(word 2,$(subst -, ,$(firstword $(firstword $(subst /, ,$(dir $@)))))))

%.bemdecl.js: %.bemjson.js
	$(call BEM_CREATE,bemdecl.js,$(firstword $(subst /, ,$(dir $@))))

.PRECIOUS: %.ie.css
%.ie.css: %.deps.js
	$(call BEM_BUILD,ie.css,$(word 2,$(subst -, ,$(firstword $(firstword $(subst /, ,$(dir $@)))))))
	borschik -t css -i $(@D)/$(*F).css -o $(@D)/_$(*F).css
	csso -i $(@D)/_$(*F).css -o $(@D)/_$(*F).css

.PRECIOUS: %.css
%.css: %.deps.js
	$(call BEM_BUILD,css,$(word 2,$(subst -, ,$(firstword $(firstword $(subst /, ,$(dir $@)))))))
	borschik -t css -i $(@D)/$(*F).css -o $(@D)/_$(*F).css
	csso -i $(@D)/_$(*F).css -o $(@D)/_$(*F).css


.PRECIOUS: %.js
%.js: %.deps.js
	$(call BEM_BUILD,js,$(word 2,$(subst -, ,$(firstword $(firstword $(subst /, ,$(dir $@)))))))


DO_GIT=@echo -- git $1 $2; \
	if [ -d $2 ]; \
		then \
			cd $2 && git pull origin master; \
		else \
			git clone $1 $2; \
	fi

bem-bl:
	$(call DO_GIT,git://github.com/bem/bem-bl.git,$@)


.PHONY: all
