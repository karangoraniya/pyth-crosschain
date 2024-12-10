module pyth::event {
    use sui::event::{Self};
    use sui::object::{ID};

    use pyth::price_feed::{PriceFeed};

    friend pyth::pyth;
    friend pyth::state;

    struct PythInitializationEvent has copy, drop {}

    /// Signifies that a price feed has been updated
    struct PriceFeedUpdateEvent has copy, store, drop {
        /// Value of the price feed
        price_feed: PriceFeed,
        /// Timestamp of the update
        timestamp: u64,
    }

    struct ParsedPriceInfoObjectEvent has copy, drop {
        price_id: vector<u8>,
        timestamp: u64,
        object_id: ID
    }

    public(friend) fun emit_price_feed_update(price_feed: PriceFeed, timestamp: u64 /* in seconds */) {
        event::emit(
            PriceFeedUpdateEvent {
                price_feed,
                timestamp,
            }
        );
    }

     public(friend) fun emit_parse_price_info_object(
        price_id: vector<u8>,
        timestamp: u64,
        object_id: ID
    ) {
        event::emit(ParsedPriceInfoObjectEvent { 
            price_id,
            timestamp, 
            object_id
        });
    }

    public(friend) fun emit_pyth_initialization_event() {
        event::emit(
            PythInitializationEvent {}
        );
    }

}
