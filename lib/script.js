/**
 * CreateEvent to create new events
 * @param {org.ticketbooking.network.CreateEvent} CreateEvent
 * @transaction
 */

function createEvent(CreateEvent) {
    console.log("Starting CreateEvent");

    var factory = getFactory();
    var NS = 'org.ticketbooking.network';
    var me = getCurrentParticipant();

    var event = factory.newResource(NS, 'ConcertEvent', CreateEvent.eventID);
    event.date = CreateEvent.date;
    event.description = CreateEvent.description;
    event.venue = CreateEvent.venue;
    event.eventHost = me;

    var ticketArray = [];   //Creating an array to hold ticket assets

    for(var i = 0; i < CreateEvent.noOfTickets; i++)
    {
        var ticket = factory.newResource(NS, 'Ticket', Ticket.ticketID);
        ticket.ticketState = org.ticketbooking.network.TicketState.UNSOLD;
        ticketArray.push(ticket);
    }
    
    getAssetRegistry('org.ticketbooking.network.Ticket').then(function (assetRegistry){
    
        assetRegistry.add(ticketArray);
    });

    return getAssetRegistry('org.ticketbooking.network.ConcertEvent').then(function (assetRegistry){
        
            return assetRegistry.add(event);
        });
}

/**
 * SellTicket to sell tickets in the business network
 * @param {org.ticketbooking.network.SellTicket} SellTicket 
 * @transaction
 */

function sellTicket(SellTicket) {
    console.log("Starting SellTicket");

    var ticket = SellTicket.ticket;
    var factory = getFactory();
    
    if(ticket.ticketState ==  org.ticketbooking.network.TicketState.UNSOLD)
    {
        return "Ticket is UNSOLD! Error";
    }
    
    ticket.ticketState = org.ticketbooking.network.TicketState.SALE;
    ticket.owner = SellTicket.buyer;

    var ticketListing = factory.newResource(NS, 'TicketListing', TicketListing.ticketListingID);

    ticketListing.listingPrice = SellTicket.salePrice;
    ticketListing.ticket = ticket;

    getAssetRegistry('org.ticketbooking.network.TicketListing').then(function (assetRegistry){
    
        assetRegistry.add(ticketListing);
    });

    return getAssetRegistry('org.ticketbooking.network.Ticket').then(function (assetRegistry){
        
        return assetRegistry.update(ticket);
    });
}

/**
 * ReellTicket to resell tickets in the business network
 * @param {org.ticketbooking.network.ResellTicket} ResellTicket 
 * @transaction
 */

function resellTicket(ResellTicket) {
    console.log("ResellTicket started");

    var ticketListing = ResellTicket.ticketListing;
    var ticket = ticketListing.ticket;

    if(ticket.ticketState == org.ticketbooking.network.TicketState.RESELL || ticket.ticketState == org.ticketbooking.network.TicketState.UNSOLD)
    {
        return "Error! Ticket already READY or UNSOLD";
    }
    
    ticket.ticketState = org.ticketbooking.network.TicketState.SALE;
    ticket.owner = ResellTicket.buyer;

    var ticketListing = factory.newResource(NS, 'TicketListing', TicketListing.ticketListingID);

    ticketListing.listingPrice = SellTicket.salePrice;
    ticketListing.ticket = ticket;

    getAssetRegistry('org.ticketbooking.network.TicketListing').then(function (assetRegistry){
    
        assetRegistry.add(ticketListing);
    });

    return getAssetRegistry('org.ticketbooking.network.Ticket').then(function (assetRegistry){
        
        return assetRegistry.update(ticket);
    });
}

/**
 * UseTicket to use a valid ticket in the business network
 * @param {org.ticketbooking.network.UseTicket} UseTicket 
 * @transaction
 */

function useTicket(UseTicket) {
    console.log("UseTicket has started");

    var ticket = UseTicket.ticket;

    if(ticket.ticketState ==  org.ticketbooking.network.TicketState.UNSOLD)
    {
        return "Ticket is UNSOLD! Error";
    }

    ticket.ticketState = org.ticketbooking.network.TicketState.USED;

    var ticketListing = factory.newResource(NS, 'TicketListing', TicketListing.ticketListingID);

    ticketListing.ticket = ticket;

    getAssetRegistry('org.ticketbooking.network.TicketListing').then(function (assetRegistry){
    
        assetRegistry.add(ticketListing);
    });

    return getAssetRegistry('org.ticketbooking.network.Ticket').then(function (assetRegistry){
        
        return assetRegistry.update(ticket);
    });
}