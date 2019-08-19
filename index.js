(function(action) {
    var css =
    'span.i18n-chunk {' +
        'position: relative;' +
        'cursor:   pointer;'  +
    '}' +
    'span.i18n-translated,'   +
    'span.i18n-chunk:hover {' +
        'background: #80b0f0;' +
        'color:      #000000;' +
    '}' +
    'span.i18n-translating {' +
        'background: #9acaff!important;' +
        'color:      #000000;'           +
    '}' +
    'span.i18n-translation {' +
        'white-space: nowrap;'   +
        'background:  #f0a000;'  +
        'position:    absolute;' +
        'top:         -1em;'     +
    '}', forbidden = ['script', 'style'], word = /([\w\u0218-\u021b\u015e\u015f\u0162\u0163\u0102\u0103\u00c2\u00e2\u00ce\u00ee\u0400-\u04ff-]+)/g;

    window.i18n    = window.i18n    || {};
    window.i18n.sl = window.i18n.sl || 'en';
    window.i18n.dl = window.i18n.dl || 'ru';

    window.i18n.translate = function(json) {
        this.source.firstChild.textContent = json[0][0][0];
        this.source.className = 'i18n-chunk i18n-translated';
        this.source = null;
    };

    ({
        bootstrap: function() {
            var it = this,
                style = document.createElement('style'),
                nodeIter = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT, null, false),
                textNode, span, i, j, c;

            style.appendChild(document.createTextNode(css));
            document.head.appendChild(style);

            while (textNode = nodeIter.nextNode()) {
                if (forbidden.indexOf(textNode.parentNode.nodeName.toLowerCase()) == -1 && textNode.parentNode.parentNode.className.indexOf('i18n-text') == -1 && /\S+/.test(textNode.textContent)) {
                    span = document.createElement('span');
                    span.className = 'i18n-text';
                    span.innerHTML = textNode.nodeValue.replace(word, '<span class="i18n-chunk">$1</span>');

                    for (i = j = 0, c = span.childNodes.length; i < c; i++) {
                        if (span.childNodes[i].nodeName.toLowerCase() == 'span') {
                            span.childNodes[i].dataset.lastIndex = span.childNodes[i].dataset.firstIndex = j++;
                        } else if (/\S+/.test(span.childNodes[i].textContent)) {
                            j++;
                        }
                    }

                    textNode.parentNode.replaceChild(span, textNode);
                }
            }

            document.addEventListener('click', function(event) {
                if (i18n.source == null && event.target.className.indexOf('i18n-chunk') != -1 && event.target.className.indexOf('i18n-translated') == -1) {
                    it.transform(event.target);
                }
            });
        },
        aggregate: function(chunk, master, detail, index) {
            var node;

            chunk.removeChild(chunk.firstChild);

            while ((node = master.nextSibling) && node != detail) {
                master.appendChild(node);
            }

            master.appendChild(document.createTextNode(detail.textContent));
            master.dataset.lastIndex = index;
            detail.parentNode.removeChild(detail);
        },
        transform: function(el) {
            var prev = el.previousElementSibling, next = el.nextElementSibling, source = el;

            if (prev && (prev.dataset.lastIndex == parseInt(el.dataset.firstIndex) - 1) && prev.className.indexOf('i18n-translated') != -1) {
                this.aggregate(prev, prev, el, el.dataset.firstIndex);
                source = prev;
            }

            if (next && (next.dataset.firstIndex == parseInt(el.dataset.lastIndex) + 1) && next.className.indexOf('i18n-translated') != -1) {
                this.aggregate(next, next.previousElementSibling, next, next.dataset.lastIndex);
            }

            this.translate(source);
        },
        translate: function(source) {
            var script = document.createElement('script');

            source.className = 'i18n-chunk i18n-translating';
            source.innerHTML = '<span class="i18n-translation"></span>' + source.textContent;

            window.i18n.source = source;

            script.src = 'https://jsonp.afeld.me/?callback=i18n.translate&url=' + encodeURIComponent(
                'https://translate.google.com/translate_a/single?client=gtx&dt=t&sl=' + window.i18n.sl + '&tl=' + window.i18n.dl + '&q=' + encodeURIComponent(source.textContent)
            );

            document.body.appendChild(script);
        }
    })[action]();
})('bootstrap');
