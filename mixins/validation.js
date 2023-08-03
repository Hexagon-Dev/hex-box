export default {
    data() {
        return {
            rules: {
                required: v => !!v || 'Field is required',
                email: v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || 'Field must be valid email',
            },
        };
    },
    methods: {
        minRule(length) {
            return v => v.length >= length || `Min field length is ${length} character(s)`;
        },
        maxRule(length) {
            return v => v.length <= length || `Max field length is ${length} character(s)`;
        },
    },
};
